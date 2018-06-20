#include "traymanager.h"

#include "trayicon.h"

#include <QMenu>

TrayManager::TrayManager(QObject* parent)
    : QObject(parent) {
    // Initialize icon
    icon.addFile(":/icons/icon-16.png");
    icon.addFile(":/icons/icon-22.png");
}

void TrayManager::setIcon(int id, const QPixmap& icon) {
    getOrCreate(id).icon(icon);
}

void TrayManager::setTitle(int id, QString title) {
    getOrCreate(id).title(title);
}

void TrayManager::highlight(int id, bool enabled) {
    TrayIcon*& iconPtr = icons[id];
    if (iconPtr == nullptr) {
        return;
    }
    iconPtr->highlight(enabled);
}

void TrayManager::hide(int id) {
    TrayIcon*& iconPtr = icons[id];
    if (iconPtr == nullptr) {
        return;
    }
    iconPtr->hide();
    delete iconPtr;
    iconPtr = nullptr;
}

TrayIcon& TrayManager::getOrCreate(int id) {
    TrayIcon*& iconPtr = icons[id];
    if (iconPtr != nullptr) {
        return *iconPtr;
    }

    iconPtr = new TrayIcon(icon, this);

    // Connect everything up
    connect(iconPtr, &TrayIcon::activated, this,
            [=](QSystemTrayIcon::ActivationReason reason) { emit activated(id, reason); });
    connect(iconPtr, &TrayIcon::unpinRequested, this, [=]() { emit unpinRequested(id); });

    return *iconPtr;
}
