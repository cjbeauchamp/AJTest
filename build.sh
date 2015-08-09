export AJ_ROOT=/home/pi/alljoyn

g++ -D QCC_OS_GROUP_POSIX \
 -I $AJ_ROOT/core/alljoyn/build/linux/arm/debug/dist/cpp/inc/ \
 -I inc/ \
 -o demo \
 src/TBStartAllJoyn.cpp src/tinyxml2.cpp src/openwrt/platform.cpp src/example.cpp\
 $AJ_ROOT/core/alljoyn/build/linux/arm/debug/dist/cpp/lib/libajrouter.a \
 $AJ_ROOT/core/alljoyn/build/linux/arm/debug/dist/cpp/lib/liballjoyn.a \
 -lstdc++ -lm -lpthread -lrt -lssl -lcrypto