console.log("content script loaded");
// import { jsQR } from './jsQR.js';
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "openLink") {
        openLink(request.srcUrl);
    } else if (request.action === "copyLink") {
        copyLink(request.srcUrl);
    }
});

async function openLink(srcUrl) {
    try {
        const response = await fetch(srcUrl);
        const blob = await response.blob();
        const qrCodeLinks = await readQRCodeFromImageBlob(blob);
        if (qrCodeLinks && qrCodeLinks.length > 0) {
            qrCodeLinks.forEach(link => window.open(link));
        } else {
            alert("图像中未找到二维码.");
        }
    } catch (error) {
        alert("处理图像时出错: " + error.message);
    }
}

async function copyLink(srcUrl) {
    try {
        const response = await fetch(srcUrl);
        const blob = await response.blob();
        const qrCodeLinks = await readQRCodeFromImageBlob(blob);
        if (qrCodeLinks && qrCodeLinks.length > 0) {
            const linksText = qrCodeLinks.join("\n");

            if (navigator.clipboard && navigator.clipboard.writeText) {
                // navigator.clipboard 启用
                await navigator.clipboard.writeText(linksText);
            }else {
                var input = document.createElement('input');
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('value', linksText);
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
            }
            alert("链接已复制到剪贴板.");
        } else {
            alert("图像中未找到二维码.");
        }
    } catch (error) {
        alert("处理图像时出错: " + error.message);
    }
}

async function readQRCodeFromImageBlob(imageBlob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function() {
            const image = new Image();
            image.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                try {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        resolve([code.data]);
                    } else {
                        resolve([]);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(imageBlob);
    });
}
