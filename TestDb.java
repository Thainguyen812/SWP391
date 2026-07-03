import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDb {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5433/parking_db", "parking_user", "ParkingDB@2024!");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT count(*) FROM parking_sessions");
        if(rs.next()) System.out.println("Total parking_sessions: " + rs.getInt(1));
        rs.close();
        
        rs = stmt.executeQuery("SELECT count(*) FROM parking_sessions WHERE session_status = 'ACTIVE'");
        if(rs.next()) System.out.println("ACTIVE parking_sessions: " + rs.getInt(1));
        rs.close();

        rs = stmt.executeQuery("SELECT count(*) FROM vehicles");
        if(rs.next()) System.out.println("Total vehicles: " + rs.getInt(1));
        rs.close();

        stmt.close();
        conn.close();
    }
}
