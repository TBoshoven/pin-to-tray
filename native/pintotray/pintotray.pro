#-------------------------------------------------
#
# Project created by QtCreator 2018-05-13T23:57:32
#
#-------------------------------------------------

QT       += core

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = pintotray
TEMPLATE = app

DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

# Enable C++11
QMAKE_CXXFLAGS += -std=c++11

SOURCES += \
        main.cpp \
    commandhandler.cpp \
    messagewriter.cpp \
    commands.cpp \
    traymanager.cpp \
    commandgenerator.cpp \
    messagereader.cpp \
    trayicon.cpp

HEADERS += \
    commandhandler.h \
    messagewriter.h \
    command.h \
    commands.h \
    traymanager.h \
    commandgenerator.h \
    messagereader.h \
    trayicon.h

DISTFILES +=

RESOURCES += \
    icons.qrc
