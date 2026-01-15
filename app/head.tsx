export default function Head() {
  const publisherId =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "ca-pub-3375122749252035";
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false";

  if (!enabled || !publisherId) return null;

  // AdSense recommends placing this script tag in <head>.
  // Using a plain <script> avoids Next's Script wrapper attributes.
  return (
    <>
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
      />
    </>
  );
}

