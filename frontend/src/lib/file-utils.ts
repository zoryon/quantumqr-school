export const convertSvgToImage = async (
    svgDataUrl: string,
    format: "png" | "jpeg" | "jpg",
    size = 1024
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Canvas context not found"));
                return;
            }

            // Fill background with white for JPEG formats
            if (format !== "png") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, size, size);
            }

            ctx.drawImage(img, 0, 0, size, size);
            const mimeType = format === "png" ? "image/png" : "image/jpeg";
            resolve(canvas.toDataURL(mimeType));
        };
        img.onerror = reject;
        img.src = svgDataUrl;
    });
};