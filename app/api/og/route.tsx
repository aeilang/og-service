import { ImageResponse } from "@takumi-rs/image-response";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const fonts = [
    {
        name: "Twemoji",
        data: fs.readFileSync(
            path.join(process.cwd(), "public/fonts/TwemojiMozilla-colr.woff2"),
        ),
    },
    {
        name: "Geist",
        data: fs.readFileSync(
            path.join(process.cwd(), "public/fonts/Geis.woff2"),
        ),
    },
];

const STATIC_TOKEN = process.env.STATIC_TOKEN;

interface AssetItem {
    thumbnail: string[];
}

interface AssetResponse {
    urls?: AssetItem[];
    name?: string;
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Missing Authorization header", { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (token !== STATIC_TOKEN) {
        return new Response("Invalid token", { status: 403 });
    }

    const params = request.nextUrl.searchParams;

    const name = params.get("name");
    if (!name) {
        return new Response("Missing name parameter", { status: 400 });
    }

    let images = params.getAll("imageUrls");
    if (!Array.isArray(images)) {
        return new Response("Invalid imageUrls parameter", { status: 400 });
    }

    images = images.slice(0, 3);

    const imageDataUrls = await Promise.all(
        images.map((imageUrl) => imageUrlToBase64(imageUrl)),
    );

    return new ImageResponse(
        <div tw="w-full h-full justify-center bg-zinc-900 items-center">
            <div tw="flex gap-6 w-full max-w-6xl justify-center items-center p-1">
                <div tw="flex space-x-4 w-full justify-center">
                    {imageDataUrls.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Image ${index + 1}`}
                            tw="w-1/3 h-95 object-cover rounded-lg p-1"
                        />
                    ))}
                </div>
            </div>

            <div
                tw="absolute left-8 bottom-8 text-white text-6xl font-bold"
                style={{
                    fontFamily: "Geist",
                }}
            >
                {name}
            </div>

            <div tw="absolute right-8 top-8 flex items-center gap-1">
                <svg width="40" height="38" viewBox="0 0 32 31" fill="none">
                    <path
                        d="M25.473 11.867c-2.94-.689-6.265-.91-5.458-6.276L25.96 7.26l2.039.492A7.444 7.444 0 0 0 20.555.5H7.403A7.406 7.406 0 0 0 0 7.905v6.229c0 2.089 1.127 2.67 2.529 2.999 2.94.689 6.265.91 5.458 6.276L2.043 21.74l-2.039-.492A7.403 7.403 0 0 0 7.405 28.5h13.192a7.407 7.407 0 0 0 7.405-7.405v-6.229c0-2.089-1.126-2.673-2.529-3.001v.002Zm-3.001 2.636a13.413 13.413 0 0 0-8.47 8.467 13.403 13.403 0 0 0-8.472-8.467V14.5a13.413 13.413 0 0 0 8.471-8.466 13.403 13.403 0 0 0 8.47 8.466v.004Z"
                        fill="white"
                    ></path>
                </svg>

                <div tw="text-white text-3xl font-bold font-sans">
                    Imagine Art
                </div>
            </div>
        </div>,
        {
            width: 800,
            height: 400,
            format: "WebP",
            fonts,
        },
    );
}

async function imageUrlToBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();

    const mimeType: string =
        response.headers.get("content-type") || "image/jpeg";

    const base64: string = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl: string = `data:${mimeType};base64,${base64}`;

    return dataUrl;
}
