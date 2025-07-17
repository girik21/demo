import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";

interface State {
    topic: string;
    joke?: string;
    improved_joke?: string;
    final_joke?: string;
}

// Initalizing the graph state that we want the LLM to follow
const StateSchema = z.object({
    topic: z.string(),
    joke: z.string().optional(),
    improved_joke: z.string().optional(),
    final_joke: z.string().optional(),
});

export async function AgenticJoker() {

    // Defining the LLM model that we want to use
    const llm = new ChatGoogleGenerativeAI({ model: "gemini-2.5-pro", apiKey: process.env.GEMINI_API_KEY })


    // Function that generates code for the first time
    async function generateJoke(state : State) {
        const msg = await llm.invoke(`Write one short joke about this topic ${state.topic}`)
        return { "joke": msg.content }
    }

    // Improving the joke
    async function improve_joke(state : State) {
        const msg = await llm.invoke(`Make the joke funnier by adding wordplay: ${state.joke}`)
        return { "improved_joke": msg.content }
    }

    // Final touches to the joke
    async function polish_joke(state : State) {
        const msg = await llm.invoke(`Add a one suprising twist to this joke and return only one joke: ${state.improved_joke}`)
        return { "final_joke": msg.content }
    }

    // Gate function to check if the joke has a punchline
    async function check_punchline(state : State) {
        const joke = state.joke

        if (typeof joke === "string" && (joke.includes("?") || joke.includes("!"))) {
            return "PASS"
        }

        return "FAIL"

    }

    const workflow = new StateGraph(StateSchema)

    workflow.addNode("generate_joke", generateJoke)
    workflow.addNode("improve_joke", improve_joke)
    workflow.addNode("polish_joke", polish_joke)

    workflow.addEdge(START, "generate_joke")
    workflow.addConditionalEdges("generate_joke", check_punchline, { "PASS": "improve_joke", "FAIL": END })
    workflow.addEdge("improve_joke", "polish_joke")
    workflow.addEdge("polish_joke", END)

    const chain = workflow.compile()

    const output = await chain.invoke({ "topic": "cats" })

    console.log("Inital Joke:")
    console.log(`${output.joke}`)

    if (output.improved_joke) {
        console.log("Inital Joke:")
        console.log(`${output.improved_joke}`)
        console.log(`${output.final_joke}`)
    } else {
        console.log("Joke was not good enough, failed at punchline")
    }

    return output;

}
