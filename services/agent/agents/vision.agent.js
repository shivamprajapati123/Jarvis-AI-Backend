import { checkAgentLimit } from "../config/agentLimit.js"
export const visionAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"image")
const prompt=state.prompt.trim()
if (!prompt) {
    throw new Error("Enter a description of the image to generate.")
}
const imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`

return {
...state,
images:[imageUrl],
aiResponse:`Generated image for: ${prompt}`,
}
} catch (error) {
   console.error("Vision agent failed:", error?.code || error?.name || "UnknownError")
       return {
           ...state,
           aiResponse:"Failed to generate the image. Check the image provider configuration and try again.",
       }
}
   


}