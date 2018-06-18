#ifndef TRAYMANAGER_H
#define TRAYMANAGER_H

#include <QMap>
#include <QSystemTrayIcon>

/**
 * A way to manage multiple system tray icons.
 */
class TrayManager : public QObject {
    Q_OBJECT
public:
    /**
     */
    TrayManager(QObject* parent = nullptr);

    /**
     * Change an icon to a specific image.
     *
     * @param id The icon ID.
     * @param icon The image to change to.
     */
    void setIcon(int id, const QPixmap& icon);

    /**
     * Change the title of an icon.
     *
     * @param id The icon ID.
     * @param title The new title for the icon.
     */
    void setTitle(int id, QString title);

    /**
     * Hide (remove) an icon.
     *
     * @param id The icon ID.
     */
    void hide(int id);
signals:
    /**
     * Signal which is fired when an icon is activated.
     *
     * @param id The ID of the icon which was activated.
     * @param reason The activation reason (typically a mouse click).
     */
    void activated(int id, QSystemTrayIcon::ActivationReason reason);

    /**
     * Signal which is fired when an unpin request is made for an icon.
     *
     * @param id The ID of the icon for which the unpin was requested.
     */
    void unpinRequested(int id);

private:
    /**
     * The map ID -> Icon .
     */
    QMap<int, QSharedPointer<QSystemTrayIcon>> icons;

    /**
     *  The application icon; used in menus.
     */
    QIcon icon;

    /**
     * If the icon exists, simply return it.
     * Otherwise, create it first and then return it.
     *
     * @param id The ID of the icon to return.
     * @return The requested icon.
     */
    QSharedPointer<QSystemTrayIcon>& getOrCreate(int id);
};

#endif // TRAYMANAGER_H