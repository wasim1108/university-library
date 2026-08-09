import config from '@/lib/config';
// import Imagekit from '@imagekit/next';
import { NextResponse } from 'next/server';
import { getUploadAuthParams } from "@imagekit/next/server"

const {
    env: {
        imagekit: {publicKey, privateKey, urlEndPoint}
    }
} = config

// const ImageKit = (Imagekit as any).default ?? Imagekit
// const imagekit = new ImageKit({publicKey, privateKey, urlEndPoint})

export async function GET() {

    const { token, expire, signature } = getUploadAuthParams({
        privateKey: privateKey as string, // Never expose this on client side
        publicKey: publicKey as string,
        // expire: 30 * 60, // Optional, controls the expiry time of the token in seconds, maximum 1 hour in the future
        // token: "random-token", // Optional, a unique token for request
    })
    return NextResponse.json({ token, expire, signature, publicKey: process.env.publicKey })
}