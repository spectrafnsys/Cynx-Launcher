;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export default function UpdaterPage() {
  const [, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        setUpdating(true);
        const update = await check();
        if (update) {
          console.log(
            `Found update ${update.version} from ${update.date} with notes: ${update.body}`
          );
          let downloaded = 0;
          let contentLength = 0;
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case "Started":
                contentLength = event.data?.contentLength ?? 0;
                console.log(`Started downloading ${contentLength} bytes`);
                break;
              case "Progress":
                downloaded += event.data?.chunkLength ?? 0;
                console.log(`Downloaded ${downloaded} of ${contentLength}`);
                break;
              case "Finished":
                console.log("Download finished");
                break;
            }
          });
          console.log("Update installed");
          await relaunch();
        }
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (e) {
        console.error("Failed to update:", e);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } finally {
        setUpdating(false);
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center text-white flex-col">
      <div className="flex flex-col p-10 bg-[#101010] backdrop-blur-sm border border-white/20 rounded-lg gap-4 justify-center items-center shadow-2xl max-w-md">

        <div className="flex flex-col text-center gap-2">
          <h2 className="text-2xl font-semibold text-white">
            Preparing Pulse
          </h2>
          <p className="text-gray-300">Please wait, we are looking to see if there is any updates!.</p>
        </div>
        <div className="h-8 w-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
