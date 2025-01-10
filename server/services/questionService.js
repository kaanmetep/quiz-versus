import supabase from "../../utils/supabase.js";

export const fetchQuestions = async (category) => {
  const categories = new Map([
    ["general", 1],
    ["science", 2],
    ["history", 3],
    ["movies", 4],
  ]);
  try {
    const { data, error } = await supabase.rpc("get_random_questions", {
      p_category_id: categories.get(category),
    });

    if (error) {
      console.error("Error fetching questions:", error);
      return null;
    }
    console.log("Fetched questions:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchQuestions:", error);
    return null;
  }
};
