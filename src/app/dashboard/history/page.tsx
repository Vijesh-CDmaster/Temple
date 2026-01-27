import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const visitHistory = [
    { id: 1, temple: "Somnath Temple", date: "2024-05-12", status: "Completed" },
    { id: 2, temple: "Dwarkadhish Temple", date: "2024-03-20", status: "Completed" },
    { id: 3, temple: "Ambaji Temple", date: "2023-11-05", status: "Completed" },
]

export default function HistoryPage() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Visit History</h1>
                <p className="text-muted-foreground">A record of your past darshans</p>
            </div>
            
            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Temple</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visitHistory.map((visit) => (
                            <TableRow key={visit.id}>
                                <TableCell className="font-medium">{visit.temple}</TableCell>
                                <TableCell>{visit.date}</TableCell>
                                <TableCell>{visit.status}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}
