export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-8 md:p-12 border border-zinc-800 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-red-500 text-center">CHÍNH SÁCH BẢO MẬT</h1>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p className="italic text-zinc-400">
            Tại BELLA TOEIC AI, chúng tôi coi trọng và tôn trọng quyền riêng tư của người dùng. Chính sách bảo mật này giải thích rõ ràng cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn khi bạn sử dụng hệ thống.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-2">1. Thông tin chúng tôi thu thập</h2>
          <p>Khi bạn đăng ký và sử dụng dịch vụ, chúng tôi có thể thu thập các loại dữ liệu sau:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>**Thông tin định danh cá nhân**: Họ tên, địa chỉ email, ảnh đại diện (nếu bạn đăng nhập bằng Google/Facebook) và mật khẩu (đã được mã hóa).</li>
            <li>**Dữ liệu học tập**: Lịch sử làm bài, điểm số các phần thi Listening/Reading, tiến độ từ vựng/ngữ pháp, thời gian truy cập.</li>
            <li>**Thông tin kỹ thuật**: Địa chỉ IP, loại trình duyệt, loại thiết bị và thông tin sử dụng cookie để tối ưu hóa trải nghiệm.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">2. Mục đích sử dụng thông tin</h2>
          <p>Dữ liệu của bạn được BELLA TOEIC AI sử dụng vào các mục đích chính đáng sau:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cung cấp quyền truy cập, xác thực và duy trì tài khoản của bạn.</li>
            <li>Đưa vào hệ thống phân tích AI để đánh giá năng lực và tự động tạo ra lộ trình học cá nhân hóa phù hợp nhất với trình độ của bạn.</li>
            <li>Gửi các thông báo quan trọng về thay đổi dịch vụ, tính năng mới hoặc mã xác thực (OTP).</li>
            <li>Phân tích thống kê ẩn danh nhằm mục đích nghiên cứu, phát triển và nâng cấp chất lượng ứng dụng.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">3. Chia sẻ thông tin</h2>
          <p>
            BELLA TOEIC AI cam kết **KHÔNG BÁN, CHO THUÊ HOẶC TRAO ĐỔI** thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại. Chúng tôi chỉ chia sẻ dữ liệu trong các trường hợp bắt buộc:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>**Cung cấp dịch vụ**: Chia sẻ cho các đối tác hạ tầng (server, dịch vụ gửi email) dưới các thỏa thuận bảo mật nghiêm ngặt (Ví dụ: gửi email OTP qua Nodemailer/SMTP).</li>
            <li>**Yêu cầu pháp lý**: Khi có yêu cầu hợp lệ từ cơ quan thực thi pháp luật hoặc cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">4. Bảo mật dữ liệu</h2>
          <p>
            Bảo mật thông tin của bạn là ưu tiên hàng đầu. Chúng tôi sử dụng nhiều biện pháp kỹ thuật như mã hóa mật khẩu bằng bcrypt, xác thực người dùng bằng JWT (JSON Web Tokens), và bảo vệ cơ sở dữ liệu sau tường lửa. Mặc dù không có hệ thống lưu trữ trực tuyến nào an toàn 100%, chúng tôi luôn nỗ lực áp dụng các tiêu chuẩn cao nhất để hạn chế tối đa rủi ro rò rỉ dữ liệu.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">5. Quyền của người dùng</h2>
          <p>Bạn luôn có quyền kiểm soát đối với dữ liệu của mình, bao gồm:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Truy cập và cập nhật thông tin cá nhân của bạn trên trang Quản lý Hồ sơ.</li>
            <li>Yêu cầu xóa toàn bộ tài khoản và dữ liệu học tập liên quan khỏi hệ thống của chúng tôi vĩnh viễn.</li>
            <li>Từ chối nhận các email tiếp thị, quảng cáo (nếu có).</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">6. Sử dụng Cookie</h2>
          <p>
            Ứng dụng sử dụng cookies và các công nghệ theo dõi tương tự để lưu phiên đăng nhập (session), lưu trữ cài đặt giao diện (Light/Dark mode) và phân tích hành vi người dùng nhằm cải thiện tốc độ và tính năng của trang web. Bạn có thể tự do tắt cookies trong trình duyệt, nhưng điều này có thể làm giảm một số trải nghiệm sử dụng nền tảng.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">7. Liên hệ</h2>
          <div className="mt-12 pt-6 border-t border-zinc-700">
            <p className="text-zinc-400">
              Nếu bạn có bất kỳ câu hỏi hoặc khiếu nại nào liên quan đến Chính sách bảo mật này, xin vui lòng liên hệ với Đội ngũ Hỗ trợ Dữ liệu của chúng tôi qua email: <a href="mailto:privacy@bella-toeic-ai.com" className="text-red-500 hover:underline">privacy@bella-toeic-ai.com</a>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
