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

function animateIcon() {
    stopAnimation();
    animation = Array.from(arguments);
    animationInterval = setInterval(function() {
        let next = animation.shift();
        animation.push(next);
        setIcon(next);
    }, 500);
}

function stopAnimation() {
    if (animationInterval !== null) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}
