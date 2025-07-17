import { AgenticJoker } from "../../../lib/workflow";

export async function GET() {
    try {
        const result = await AgenticJoker();
        return Response.json(result);
    } catch (error) {
        console.error("AgenticJoker failed:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}