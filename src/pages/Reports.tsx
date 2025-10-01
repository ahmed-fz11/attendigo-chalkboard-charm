import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import attendigoBg1 from "@/assets/attendigo_bg1.png";
import { Download, Clock, Calendar, AlertTriangle } from "lucide-react";

const Reports = () => {
  const summaryData = [
    { 
      title: "Average Attendance", 
      value: "92%", 
      icon: "👥",
      bgColor: "bg-accent-blue/20 border-accent-blue/30"
    },
    { 
      title: "Absences this week", 
      value: "12", 
      subtitle: "Absences",
      icon: "📅",
      bgColor: "bg-accent-yellow/20 border-accent-yellow/30"
    },
    { 
      title: "Students flagged", 
      value: "3", 
      subtitle: "Students",
      icon: "⚠️",
      bgColor: "bg-accent-orange/20 border-accent-orange/30"
    },
  ];

  const dailyLogs = [
    { date: "Jan. 20", class: "Grade 8 - Section B", attendance: "93%", notes: "" },
    { date: "Jan. 19", class: "Grade 8 - Section B", attendance: "89%", notes: "" },
    { date: "Jan. 18", class: "Grade 7 - Section C", attendance: "95%", notes: "" },
    { date: "Jan. 17", class: "Grade 6 - Section A", attendance: "90%", notes: "" },
  ];

  const aiInsights = [
    { 
      icon: <Clock className="w-5 h-5 text-accent-orange" />, 
      text: "Late arrivals spike on Mondays" 
    },
    { 
      icon: <Calendar className="w-5 h-5 text-accent-blue" />, 
      text: "Absences higher on holidays" 
    },
  ];

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${attendigoBg1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-preference'
      }}
    >
      <Navbar showAttendanceButton />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Reports Section */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="backdrop-blur-sm bg-card/95 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {summaryData.map((item, index) => (
                    <Card key={index} className={`${item.bgColor} border`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
                        <div className="text-sm text-foreground">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Daily Logs Table */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Daily Logs</h3>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-t-lg font-semibold text-primary">
                        <div>Date</div>
                        <div>Class</div>
                        <div>Attendance %</div>
                        <div>Notes</div>
                      </div>
                      {dailyLogs.map((log, index) => (
                        <div 
                          key={index} 
                          className={`grid grid-cols-4 gap-4 p-4 border-b ${
                            index % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'
                          }`}
                        >
                          <div className="font-medium">{log.date}</div>
                          <div>{log.class}</div>
                          <div className="font-semibold text-primary">{log.attendance}</div>
                          <div className="text-muted-foreground">{log.notes || '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/95 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-primary">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    {insight.icon}
                    <span className="text-sm">{insight.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Download Buttons */}
            <div className="space-y-3">
              <Button variant="secondary" className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;