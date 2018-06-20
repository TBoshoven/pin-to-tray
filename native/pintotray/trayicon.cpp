#include "trayicon.h"

#include <QAction>

TrayIcon::TrayIcon(const QIcon& defaultIcon, QObject* parent)
    : QObject(parent)
    , mIcon(defaultIcon)
    , mIconPixmap(mIcon.pixmap(22, 22)) {
    QAction* unpinAction = mContextMenu.addAction("Unpin");
    connect(&mSystemTrayIcon, &QSystemTrayIcon::activated, this,
            [this](QSystemTrayIcon::ActivationReason activationReason) { emit activated(activationReason); });
    connect(unpinAction, &QAction::triggered, this, [this]() { emit unpinRequested(); });

    mSystemTrayIcon.setContextMenu(&mContextMenu);
    mSystemTrayIcon.setIcon(mIcon);

    mSystemTrayIcon.show();
}

void TrayIcon::icon(const QPixmap& icon) {
    mIconPixmap = icon;
    mIcon = QIcon(mIconPixmap);
    mSystemTrayIcon.setIcon(mIcon);
}

void TrayIcon::title(QString title) {
    mSystemTrayIcon.setToolTip(title);
}

void TrayIcon::hide() {
    mSystemTrayIcon.hide();
}
