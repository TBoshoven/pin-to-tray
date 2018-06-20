let animation = [];
let animationInterval = null;

function removeIcons() {
    document.querySelectorAll("link[rel=icon]").forEach(e => e.remove());
}

function addIcon(url) {
    let link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("href", url);
    link.setAttribute("type", "image/png");
    document.head.append(link);
}

function setIcon(url) {
    removeIcons();
    addIcon(url);
}

function changeIcon(url) {
    let link = document.querySelector("link[rel=icon]");
    if (link !== null) {
        link.setAttribute("href", url);
        link.setAttribute("type", "image/png");
    }
}

function animateIcon() {
    stopAnimation();
    animation = Array.from(arguments);
    animationInterval = setInterval(function() {
        let next = animation.shift();
        animation.push(next);
        setIcon(next);
    }, 500);
}

function animateIconChange() {
    stopAnimation();
    animation = Array.from(arguments);
    animationInterval = setInterval(function() {
        let next = animation.shift();
        animation.push(next);
        changeIcon(next);
    }, 500);
}

function stopAnimation() {
    if (animationInterval !== null) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}

function setTitle(title) {
    removeTitles();
    let node = document.createElement("title");
    node.innerText = title;
    document.head.append(node);
}

function removeTitles() {
    document.querySelectorAll("title").forEach(e => e.remove());
}

function appendToTitle(string) {
    let title = document.querySelector("title");
    if (title !== null) {
        title.innerText += string;
    }
}

function appendToTitleText(string) {
    let title = document.querySelector("title");
    if (title !== null) {
        for (let childNode of title.childNodes) {
            if (childNode.nodeType == 3) {
                childNode.nodeValue += string;
                break;
            }
        }
    }
}

function keepAppendingToTitle(string) {
    stopAnimation();
    animationInterval = setInterval(function() {
        appendToTitle(string);
    }, 1000);
}
