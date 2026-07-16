
import java.util.*;
import java.text.*;

public class TestTime {
    public static void main(String[] args) {
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        System.out.println("Etc/GMT+7 time: " + formatter.format(cld.getTime()));
        
        Calendar cld2 = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.out.println("Asia/Ho_Chi_Minh time: " + formatter.format(cld2.getTime()));
    }
}

