import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
import { registerGeneratedFile } from "../utils/generatedFiles.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
export const pdfAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"pdf")
        
        
        const llm=await getModel("pdf")
        const prompt=`
        You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
"title":"",
"subtitle":"",
"sections":[
{
"heading":"",
"points":[]
}
]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
        `

        const res=await llm.invoke(prompt)
        const data=JSON.parse(res.content)
        
        const pdfBuffer=await generatePdf(data)

        const filename=`pdf-${Date.now()}.pdf`
        const fileId=registerGeneratedFile({
            buffer:pdfBuffer,
            filename,
            contentType:"application/pdf",
            userId:state.userId,
        })

        await deductCredits(state.userId,"pdf")

        return {
          ...state,
          aiResponse:`# PDF Generated

**${data.title}**

📥 [Download PDF](/api/agent/download/${fileId})

_This temporary download is available for 10 minutes._`
        }

    } catch (error) {
        console.error("PDF agent failed:", error?.code || error?.name || "UnknownError")
         return {
            ...state,
            aiResponse:"Failed to generate PDF. Check the agent service logs and try again.",
        }
    }
}