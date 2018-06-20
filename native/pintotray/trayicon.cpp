#include "trayicon.h"

#include <QAction>
#include <QPainter>

TrayIcon::TrayIcon(const QIcon& defaultIcon, QObject* parent)
    : QObject(parent)
    , mIconPixmap(defaultIcon.pixmap(22, 22))
    , mHighlight(false) {
    QAction* unpinAction = mContextMenu.addAction("Unpin");
    connect(&mSystemTrayIcon, &QSystemTrayIcon::activated, this,
            [this](QSystemTrayIcon::ActivationReason activationReason) { emit activated(activationReason); });
    connect(unpinAction, &QAction::triggered, this, [this]() { emit unpinRequested(); });

    mSystemTrayIcon.setContextMenu(&mContextMenu);
    mSystemTrayIcon.setIcon(defaultIcon);

    mSystemTrayIcon.show();
}

void TrayIcon::icon(const QPixmap& icon) {
    mIconPixmap = icon;
    updateIcon();
}

void TrayIcon::title(QString title) {
    mSystemTrayIcon.setToolTip(title);
}

void TrayIcon::highlight(bool enabled) {
    mHighlight = enabled;
    updateIcon();
}

void TrayIcon::hide() {
    mSystemTrayIcon.hide();
}

void TrayIcon::updateIcon() {
    QPixmap pixmap(mIconPixmap);
    if (mHighlight) {
        QPainter painter(&pixmap);
        painter.setRenderHint(QPainter::Antialiasing);
        QPen pen(QColor(0xff0000));
        pen.setWidth(3);
        painter.setPen(pen);

        const int w(pixmap.width());
        const int h(pixmap.height());
        painter.drawLine(0, 0, w / 4, 0);
        painter.drawLine(0, 0, 0, h / 4);
        painter.drawLine(w, 0, w - w / 4, 0);
        painter.drawLine(w, 0, w, h / 4);
        painter.drawLine(0, h, w / 4, h);
        painter.drawLine(0, h, 0, h - h / 4);
        painter.drawLine(w, h, w - w / 4, h);
        painter.drawLine(w, h, w, h - h / 4);
    }
    mSystemTrayIcon.setIcon(QIcon(pixmap));
}
