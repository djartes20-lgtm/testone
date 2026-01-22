import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query obrigatória" }, { status: 400 });
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
    query
  )}&key=${process.env.YOUTUBE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  const videos = data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channel: item.snippet.channelTitle
  }));

  return NextResponse.json(videos);
}
