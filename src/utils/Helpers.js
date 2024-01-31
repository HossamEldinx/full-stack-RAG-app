import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import * as cheerio from "cheerio";
import {
  createRecoredResponse,
  sendSupabaseRecored,
  updateRecoredResponse,
} from "@/utils/Supabase";
import { createFollowup } from "@/utils/OpenAI";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const embeddings = new OpenAIEmbeddings();

const fetchAndHandle = async (list, prompt) => {
  let count = 0;
  let texts = [];
  await Promise.all(
    list.map(async (item) => {
      try {
        const response = await fetch(item.link);
        let page = await response.text();
        let extractedText = extractMainContent(page);
        // console.log(extractedText);

        if (extractedText.length > 300) {
          //texts.push({ text: extractedText });

          const splitText = await new RecursiveCharacterTextSplitter({
            chunkSize: 400,
            chunkOverlap: 0,
          }).splitText(extractedText);

          const vectorStore = await MemoryVectorStore.fromTexts(
            splitText,
            { annotationPosition: item.link },
            embeddings
          );

          let vector = await vectorStore.similaritySearch(prompt, 1);

          texts.push({
            pageContent: vector[0].pageContent,
            metadata: vector[0].metadata,
          });
          count++;
        }
      } catch (error) {
        console.log(error);
      }
    })
  );

  if (count >= 4) {
    console.log(texts);
    return texts;
  }
};

//clean the html page and extract the text out of it
function extractMainContent(html) {
  const $ = cheerio.load(html);
  $("script, style, head, nav, footer, iframe, img").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

///
async function secondStageLLM(input) {
  try {
    await handleGPTResutls(input);
    const followUpResult = await createFollowup(input);
    sendSupabaseRecored({ type: "MoreQuestion", content: followUpResult });

    console.log(followUpResult);

    return { message: "Processing request" };
  } catch (error) {
    console.log(error);
  }
}

//handle the returing stream and create the resutls

const handleGPTResutls = async (input) => {

    try {
      let content = "";

      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a answer generator, you will receive top results of similarity search, they are optional to use depending how well they help answer the query.",
          },
          { role: "user", content: input },
        ],
        stream: true,
      });

      //get recored id from supabase when it's created
      let rowId = await createRecoredResponse();
      console.log(rowId);
      //save to supabase
      sendSupabaseRecored({ type: "Headers", content: "Answer" });

      //loop over the stream
      for await (const part of stream) {
        //Check if delta content exists
        if (part.choices[0]?.delta?.content) {
          //add to content
          content += part.choices[0]?.delta?.content;
          //Update the row with new content
          rowId = await updateRecoredResponse(rowId, content);
        }
      }
    } catch (error) {

        console.log(error)
    }
};

module.exports = { fetchAndHandle, secondStageLLM };
