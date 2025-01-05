import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <Link
        href="/game"
        className="text-blue-500 hover:text-blue-600 font-bold text-2xl p-4 bg-gray-200 rounded-md shadow-md hover:bg-gray-300 transition-all duration-300 "
      >
        Start playing
      </Link>
    </div>
  );
}
