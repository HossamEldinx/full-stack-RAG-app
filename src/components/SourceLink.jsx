import React from 'react'
import { GitBranch } from "@phosphor-icons/react";

export default function SourceLink() {
    const truncateText = (text, maxLength) => (text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`);
    const extractSiteName = (url) => new URL(url).hostname.replace("www.", "");
    return (
        <>
            <div className="text-3xl font-bold my-4 w-full flex">
                <GitBranch size={32} />
                <span className="px-2">Sources</span>
            </div>
            <div className="flex flex-wrap">
                {
                    content?.map(({ title, link }) => (
                        <a href={link} className="w-1/4 p-1" key={title}>
                            <span className="flex flex-col items-center py-2 px-6 bg-white rounded shadow hover:shadow-lg transition-shadow duration-300 tile-animation h-full">
                                <span>{truncateText(title, 40)}</span>
                                <span>{extractSiteName(link)}</span>
                            </span>
                        </a>
                    ))
                }
            </div>
        </>
    );
}
