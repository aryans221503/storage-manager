// Track downloads we are pausing for disk check
const checkingDownloads = new Set();

chrome.downloads.onCreated.addListener(async (item) => {
    console.log("Download started:", item);

    try {
        checkingDownloads.add(item.id);

        // Pause the download immediately
        await chrome.downloads.pause(item.id);
        console.log("Download paused successfully:", item.id);

        // Open the popup automatically
        try {
            await chrome.action.openPopup();
        } catch (err) {
            console.log("Could not auto-open popup:", err);
            chrome.action.setBadgeText({ text: "!" });
            chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
        }
    } catch (error) {
        // If pause fails, just log it — do NOT cancel the download
        // The download will continue normally and the user can manage it from the popup
        console.warn("Could not auto-pause download:", item.id, error);
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
    }
});

// Smart Categorization: Route files based on extensions
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
    const filename = item.filename;
    const extension = filename.split('.').pop().toLowerCase();

    let subfolder = "";

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'webm'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
    const audioExts = ['mp3', 'wav', 'ogg', 'flac'];
    const codeExts = ['js', 'py', 'html', 'css', 'json', 'cpp', 'java'];

    if (imageExts.includes(extension)) {
        subfolder = "Images/";
    } else if (videoExts.includes(extension)) {
        subfolder = "Videos/";
    } else if (docExts.includes(extension)) {
        subfolder = "Documents/";
    } else if (archiveExts.includes(extension)) {
        subfolder = "Archives/";
    } else if (audioExts.includes(extension)) {
        subfolder = "Audio/";
    } else if (codeExts.includes(extension)) {
        subfolder = "Code/";
    } else {
        subfolder = "Others/";
    }

    suggest({
        filename: subfolder + filename,
        conflictAction: 'uniquify'
    });
});
