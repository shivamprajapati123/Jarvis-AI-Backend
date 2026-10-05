import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import { registerGeneratedFile } from "../utils/generatedFiles.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
export const pptAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"ppt")
        const llm=await getModel("ppt")
        const prompt=`You are a professional presentation designer.

Return ONLY valid JSON.

Format:

{
"title":"",
"subtitle":"",
"slides":[
{
"title":"",
"points":[
"",
"",
"",
""
]
}
]
}

Rules:

- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}`

const res=await llm.invoke(prompt)
const data=JSON.parse(res.content)
const ppt=await generatePpt(data)
const buffer=await ppt.write({
    outputType:"nodebuffer"
})

const filename=`ppt-${Date.now()}.pptx`

const fileId=registerGeneratedFile({
    buffer,
    filename,
    contentType:"application/vnd.openxmlformats-officedocument.presentationml.presentation",
    userId:state.userId,
})
await deductCredits(state.userId,"ppt")

return {
    ...state,
    aiResponse:`# ✅ Presentation Generated

**${data.title}**

📥 [Download PPT](/api/agent/download/${fileId})

_This temporary download is available for 10 minutes._`
}

    } catch (error) {
        console.error("PPT agent failed:", error?.code || error?.name || "UnknownError")
         return {
            ...state,
            aiResponse:"Failed to generate presentation. Check the agent service logs and try again.",
        }
       

       
    }
}