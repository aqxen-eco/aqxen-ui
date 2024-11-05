import Image from "next/image";
import NextLink from "next/link";

import dltImg from "@/assets/dlt.svg";
import logoImg from "@/assets/logo.svg";

export function Footer() {
  const today = new Date();
  const year = today.getFullYear();

  return (
    <footer className="mx-auto max-w-container-lg desktop:px-4">
      <div className="flex items-center justify-between gap-4 border-t border-gray-2 py-16 mobile:flex-col">
        <NextLink
          href="/"
          className="flex cursor-pointer items-center gap-1.5 text-gray-3 desktop:hover:text-white"
        >
          <Image priority src={logoImg} alt="" className="h-6 w-6" />
          <span className="text-body-1">UpScale © {year}</span>
        </NextLink>
        <a
          href="https://detroitledger.tech/"
          target="_blank"
          rel="noreferrer"
          className="opacity-70 desktop:hover:opacity-100"
        >
          <Image priority src={dltImg} alt="" />
        </a>
      </div>
    </footer>
  );
}
