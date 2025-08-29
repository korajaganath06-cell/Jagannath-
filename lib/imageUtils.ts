/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// A map of filter names to their CSS filter values
const FILTERS: Record<string, string> = {
    'none': 'none',
    'vintage': 'sepia(0.6) contrast(1.1) brightness(0.9) saturate(1.2)',
    'bw': 'grayscale(100%)',
    'sepia': 'sepia(100%)',
};

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image for filtering.`));
        img.src = src;
    });
}

/**
 * Applies a CSS filter to an image using a canvas and returns the new image as a data URL.
 * @param imageDataUrl The data URL of the source image.
 * @param filterName The name of the filter to apply (e.g., 'vintage', 'bw').
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export async function applyFilterToImage(imageDataUrl: string, filterName: string): Promise<string> {
    const filterValue = FILTERS[filterName];

    if (!filterValue || filterValue === 'none') {
        return imageDataUrl; // No filter to apply, return original
    }

    try {
        const image = await loadImage(imageDataUrl);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D canvas context for filtering.');
        }

        ctx.filter = filterValue;
        ctx.drawImage(image, 0, 0);

        // Reset filter before getting data URL to avoid canvas state issues in some browsers
        ctx.filter = 'none'; 

        return canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for smaller size
    } catch (error) {
        console.error("Error applying filter:", error);
        // Fallback to the original image if filtering fails
        return imageDataUrl;
    }
}
