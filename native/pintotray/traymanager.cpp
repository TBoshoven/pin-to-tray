#include "traymanager.h"

#include <QMenu>

TrayManager::TrayManager(QObject* parent)
    : QObject(parent) {
    // Initialize icon
    icon.addFile(":/icons/icon-16.png");
    icon.addFile(":/icons/icon-22.png");
}

void TrayManager::setIcon(int id, const QPixmap& icon) {
    QSharedPointer<QSystemTrayIcon>& iconPtr(getOrCreate(id));
    iconPtr->setIcon(QIcon(icon));
}

void TrayManager::setTitle(int id, QString title) {
    QSharedPointer<QSystemTrayIcon>& iconPtr(getOrCreate(id));
    iconPtr->setToolTip(title);
}

void TrayManager::hide(int id) {
    QSharedPointer<QSystemTrayIcon>& iconPtr = icons[id];
    if (iconPtr.isNull()) {
        return;
    }
    iconPtr->hide();
    iconPtr.reset();
}

QSharedPointer<QSystemTrayIcon>& TrayManager::getOrCreate(int id) {
    QSharedPointer<QSystemTrayIcon>& iconPtr = icons[id];
    if (iconPtr.isNull()) {
        iconPtr = QSharedPointer<QSystemTrayIcon>(new QSystemTrayIcon(this));
    }

    // Assign parent since default constructor doesn't.
    iconPtr->setParent(this);

    // Create context menu
    QMenu* contextMenu = new QMenu();
    QAction* unpinAction = contextMenu->addAction(icon, "Unpin");

    // Connect everything up
    connect(iconPtr.data(), &QSystemTrayIcon::activated, this,
            [=](QSystemTrayIcon::ActivationReason reason) { activated(id, reason); });
    connect(iconPtr.data(), &QObject::destroyed, this, [=]() { delete contextMenu; });
    connect(unpinAction, &QAction::triggered, this, [=]() { unpinRequested(id); });

    iconPtr->setIcon(icon);
    iconPtr->setContextMenu(contextMenu);
    iconPtr->show();
    return iconPtr;
}
