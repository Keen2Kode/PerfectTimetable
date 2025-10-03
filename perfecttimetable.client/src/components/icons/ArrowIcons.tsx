import type { SVGProps } from 'react';

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M15 3 L7 12 L15 21"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
        </svg>
    );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M9 3 L17 12 L9 21"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
        </svg>
    );
}
