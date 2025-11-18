#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ScreenTimePlugin, "ScreenTime",
    CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getTodayScreenTime, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getWeeklyAverage, CAPPluginReturnPromise);
)
