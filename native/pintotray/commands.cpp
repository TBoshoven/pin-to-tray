#include "commands.h"

#include "traymanager.h"

#include <QApplication>
#include <QJsonObject>
#include <QtDebug>

Commands::IconCommand::IconCommand(TrayManager& trayManager)
    : trayManager(trayManager) {}

void Commands::IconCommand::operator()(const QJsonObject& parameters, MessageWriter& messageWriter) const {
    // Get icon ID to change
    QJsonValue id = parameters["id"];
    if (id.isUndefined()) {
        qWarning() << "Missing icon id";
        return;
    }
    if (!id.isDouble()) {
        qWarning() << "Icon id has to be a number";
        return;
    }
    int idInt = id.toInt();
    (*this)(idInt, parameters, messageWriter);
}

Commands::UpdateIcon::UpdateIcon(TrayManager& trayManager)
    : IconCommand(trayManager) {}

QString Commands::UpdateIcon::name() const {
    return "UpdateIcon";
}

void Commands::UpdateIcon::operator()(int id, const QJsonObject& parameters, MessageWriter&) const {
    // Get new icon; data is encoded as PNG
    QJsonValue data = parameters["data"];
    if (data.isUndefined()) {
        qWarning() << "Missing icon data";
        return;
    }
    if (!data.isString()) {
        qWarning() << "Icon data has to be a string";
        return;
    }

    // Turn the raw PNG data into an icon
    QImage iconImage = QImage::fromData(QByteArray::fromBase64(data.toString().toUtf8()), "PNG");
    if (iconImage.isNull()) {
        qWarning() << "Invalid base64-encoded PNG data";
        return;
    }
    QPixmap icon = QPixmap::fromImage(iconImage);
    trayManager.setIcon(id, icon);
}

Commands::UpdateTitle::UpdateTitle(TrayManager& trayManager)
    : IconCommand(trayManager) {}

QString Commands::UpdateTitle::name() const {
    return "UpdateTitle";
}

void Commands::UpdateTitle::operator()(int id, const QJsonObject& parameters, MessageWriter&) const {
    // Get new title from the JSON parameters.
    QJsonValue title = parameters["title"];
    if (title.isUndefined()) {
        qWarning() << "Missing title";
        return;
    }
    if (!title.isString()) {
        qWarning() << "Title has to be a string";
        return;
    }

    trayManager.setTitle(id, title.toString());
}

Commands::HighlightIcon::HighlightIcon(TrayManager& trayManager)
    : IconCommand(trayManager) {}

QString Commands::HighlightIcon::name() const {
    return "HighlightIcon";
}

void Commands::HighlightIcon::operator()(int id, const QJsonObject& parameters, MessageWriter&) const {
    // Get new value from the JSON parameters.
    QJsonValue enabled = parameters["enabled"];
    if (enabled.isUndefined()) {
        qWarning() << "Missing highlight enabled value";
        return;
    }
    if (!enabled.isBool()) {
        qWarning() << "Highlight enabled value must be a boolean";
        return;
    }
    trayManager.highlight(id, enabled.toBool());
}

Commands::HideIcon::HideIcon(TrayManager& trayManager)
    : IconCommand(trayManager) {}

QString Commands::HideIcon::name() const {
    return "HideIcon";
}

void Commands::HideIcon::operator()(int id, const QJsonObject&, MessageWriter&) const {
    trayManager.hide(id);
}

Commands::Exit::Exit(QApplication& application)
    : application(application) {}

QString Commands::Exit::name() const {
    return "Exit";
}

void Commands::Exit::operator()(const QJsonObject&, MessageWriter&) const {
    application.exit();
}
