import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeImage, getWebpFileName } from "@/lib/utils/image";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(buffer);
  const fileName = `${user.id}/${getWebpFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("city-media")
    .upload(fileName, optimized, {
      contentType: "image/webp",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("city-media").getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
