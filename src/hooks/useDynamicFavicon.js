import { useEffect } from 'react';

export function useDynamicFavicon() {
    useEffect(() => {
        const setFavicon = () => {
            const focusColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--focus-color')
                .trim();

            if (!focusColor) return;

            const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495 495">
          <polygon fill="${focusColor}" points="317.274,40 317.274,0 177.726,0 177.726,40 227.5,40 227.5,227.5 207.5,227.5 207.5,267.5 227.5,267.5 227.5,455 177.726,455 177.726,495 317.274,495 317.274,455 267.5,455 267.5,267.5 287.5,267.5 287.5,227.5 267.5,227.5 267.5,40"/>
        </svg>`;

            const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
            let link = document.querySelector("link[rel='icon']");

            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.type = 'image/svg+xml';
            link.href = `data:image/svg+xml,${encodedSvg}`;
        };

        // Run once on mount
        setFavicon();

        // Observe changes to style (where your CSS variables are)
        const observer = new MutationObserver(setFavicon);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

        return () => observer.disconnect();
    }, []);
}