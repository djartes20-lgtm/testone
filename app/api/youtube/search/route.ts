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

  if (!response.ok || !data?.items || !Array.isArray(data.items)) {
    const message =
      data?.error?.message || "YouTube API indisponível ou chave inválida.";
    return NextResponse.json(
      { error: message },
      { status: response.ok ? 502 : response.status }
    );
  }

  const videos = data.items.map((item: any) => ({
    videoId: item.id?.videoId,
    title: item.snippet?.title,
    thumbnail: item.snippet?.thumbnails?.medium?.url,
    channel: item.snippet?.channelTitle,
  }));

  return NextResponse.json(videos);
}
