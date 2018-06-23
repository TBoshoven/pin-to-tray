#include "commandgenerator.h"
#include "commandhandler.h"
#include "commands.h"
#include "messagereader.h"
#include "messagewriter.h"
#include "traymanager.h"

#include <iostream>
#include <unistd.h>

#include <QApplication>
#include <QtDebug>

int main(int argc, char* argv[]) {
    // Initialize the application
    QApplication app(argc, argv);

    QStringList args = app.arguments();
    if (args.size() < 3) {
        qWarning("Expecting manifest and extension ID as parameters");
        return -1;
    }
    if (args[2] != "pintotray@tomboshoven.com") {
        qWarning("Incorrect extension ID");
        return -1;
    }

    app.setApplicationName("PinToTray");
    app.setQuitOnLastWindowClosed(false);

    qDebug() << "PinToTray Native module loaded";

    // Initialize I/O
    MessageReader reader(&app);
    MessageWriter writer(stdout, &app);

    writer.writeHeader();

    CommandGenerator commandGenerator(writer, &app);

    TrayManager trayManager(&app);

    // Register all accepted commands
    CommandHandler commandHandler(reader, commandGenerator, &app);
    commandHandler.registerCommand<Commands::UpdateIcon, TrayManager&>(trayManager);
    commandHandler.registerCommand<Commands::UpdateTitle, TrayManager&>(trayManager);
    commandHandler.registerCommand<Commands::HighlightIcon, TrayManager&>(trayManager);
    commandHandler.registerCommand<Commands::HideIcon, TrayManager&>(trayManager);
    commandHandler.registerCommand<Commands::Exit, QApplication&>(app);

    QObject::connect(&trayManager, SIGNAL(activated(int, QSystemTrayIcon::ActivationReason)), &commandGenerator,
                     SLOT(iconActivated(int, QSystemTrayIcon::ActivationReason)));
    QObject::connect(&trayManager, SIGNAL(unpinRequested(int)), &commandGenerator, SLOT(unpinRequested(int)));
    QObject::connect(&reader, SIGNAL(finished()), &app, SLOT(quit()));

    // Finally, start the application
    reader.start();
    return app.exec();
}
