#ifndef TRAYICON_H
#define TRAYICON_H

#include <qsystemtrayicon.h>

#include <QMenu>

class TrayIcon : public QObject {
    Q_OBJECT
public:
    TrayIcon(const QIcon& defaultIcon = QIcon(), QObject* parent = nullptr);

    /**
     * Change the icon to a specific image.
     *
     * @param icon The image to change to.
     */
    void icon(const QPixmap& icon);

    /**
     * Change the title.
     *
     * @param title The new title for the icon.
     */
    void title(QString title);

    /**
     * Change icon highlighting.
     *
     * @param enabled Whether the icon should be highlighted.
     */
    void highlight(bool enabled = true);

    /**
     * Hide the icon.
     */
    void hide();
signals:
    /**
     * Signal which is fired when the icon is activated.
     *
     * @param reason The activation reason (typically a mouse click).
     */
    void activated(QSystemTrayIcon::ActivationReason reason);

    /**
     * Signal which is fired when an unpin request is made for the icon.
     */
    void unpinRequested();

private:
    QSystemTrayIcon mSystemTrayIcon;
    QMenu mContextMenu;
    QPixmap mIconPixmap;
    bool mHighlight;

    /**
     * Re-render the icon from the pixmap.
     */
    void updateIcon();
};

#endif // TRAYICON_H
