import { NextResponse } from "next/server";
import "dotenv/config";
import { getJson } from "serpapi";
import { rephraseInput } from "@/utils/OpenAI";
import { fetchAndHandle, secondStageLLM } from "@/utils/Helpers";
import { sendSupabaseRecored } from "@/utils/Supabase";

async function searchEngineResutls(prompt) {
  try {
    const repahrasedMessage = await rephraseInput(prompt);

    
    let loader = await getJson({
      engine: "google",
      api_key:
        "", // Get your API_KEY from https://serpapi.com/manage-api-key
      q: repahrasedMessage,
    });

    const docs = loader["organic_results"];
    //console.log(docs);

    // 6. Normalize data
    function normalizeData(jsonData) {
      return jsonData.map((item) => {
        return {
          title: item.title,
          link: item.link,
        };
      });
    }

    const normalizedData = normalizeData(docs);
    console.log(normalizedData);

    let resutling = await fetchAndHandle(normalizedData.slice(0, 5), prompt);

    await sendSupabaseRecored({
      type: "MessageCreation",
      content: `Finished Scanning Sources.`,
    });

    let result = await secondStageLLM(
      `Query: ${prompt}, Top Results: ${JSON.stringify(resutling)}`
    );

    return result;
  } catch (error) {
    console.log(error);
  }
}

//this tha api end point to call
export async function POST(req) {
  try {
    const { message } = await req.json();
    console.log(message);
    let restuls = await searchEngineResutls(message);

    return NextResponse.json({ restuls });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
