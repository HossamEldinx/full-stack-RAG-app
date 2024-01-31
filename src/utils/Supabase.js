import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLIC_KEY
);
//save supabase recored 
async function sendSupabaseRecored(payload) {
  try {
    await supabase
        .from(process.env.SUPABASE_DATABASE)
        .insert([{ payload: payload }])
        .select("id");

      
  } catch (error) {
      console.log(error)
  }

}



//create new recored for gpt and return the id and strem id 
const createRecoredResponse = async () => {
  try {
      const stremId = uuidv4();

      const { data, error } = await supabase
        .from(process.env.SUPABASE_DATABASE)
        .insert([{ payload: { type: "Markdown", content: "" } }])
        .select("id");
    console.log(data)
      return { id: data ? data[0].id : null, stremId };
  } catch (error) {
    console.log(error)
  }

};


//delete the prveows row and add the new data
const updateRecoredResponse = async (prevId, content) => {
  // Create the payload again
  const payload = { type: "Markdown", content };

  // Delete the previous row
  await supabase.from(process.env.SUPABASE_DATABASE).delete().eq("id", prevId);

  //updated data
  const { data } = await supabase
    .from(process.env.SUPABASE_DATABASE)
    .insert([{ payload }])
    .select("id");

  // return the new row ID
  return data ? data[0].id : null;
};




module.exports = {
  sendSupabaseRecored,
  createRecoredResponse,
  updateRecoredResponse,
};
