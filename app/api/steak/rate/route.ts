import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

function sanitizeJSON(input: string) {
  const regex = /\{([^{}]+)\}/;
  const output = input.match(regex);
  return output ? "{" + output[1] + "}" : input;
}

const visionModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash-latest",
  maxOutputTokens: 2048,
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const input = [
      new HumanMessage({
        content: [
          {
            type: "text",
            text: `
            respond in valid JSON object without JSON markup wrapping around the response
            {
              isSteak: Boolean (is this an image of steak?),
              appearance: Integer (from scale 1-10 how good is the appearance of this steak?),
              texture: Integer (from scale 1-10 how does the texture of this steak look?),
              doneness: String (choose from 'Uncocked', 'Rare', 'Medium rare', 'Medium', 'Medium well', 'Well-done'),
              juiciness: Integer (from scale 1-10 how juicy this steak is?),
              overall: Integer (from scale 1-10 how much would you rate this steak on overall?),
              description: String (in 100 - 150 words, describe the steak in a very sophisticated way if it's not a steak leave this field blank)
            }
            `,
          },
          {
            type: "image_url",
            image_url: `data:image/png;base64,${raw.image}`,
          },
        ],
      }),
    ];

    const res = await visionModel.invoke(input);
    console.log("res.lc_kwargs.content = ", res.lc_kwargs.content);
    console.log("sanitizeJSON(res.lc_kwargs.content) = ", sanitizeJSON(res.lc_kwargs.content));
    return NextResponse.json(
      { response: sanitizeJSON(res.lc_kwargs.content) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/steak/rate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
