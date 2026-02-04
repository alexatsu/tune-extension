import { LinkIcon } from "@/assets/icons/LinkIcon";
import { YoutubeIcon } from "@/assets/icons/YoutubeIcon";

function App() {

  return (
    <main className="min-w-60 px-4 bg-linear-to-b from-[rgba(0,0,0,0.9)] to-[rgba(0,0,0,0.95)] text-amber-50">
      <h1 className='font-griffin text-4xl text-center mb-2'>Tune</h1>

      <section className="flex justify-between">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span>provider</span>
          <YoutubeIcon />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span>track</span>
          <LinkIcon />
        </div>
      </section>
      <p >
        Click on the WXT and React logos to learn more
      </p>
    </main>
  );
}

export default App;
