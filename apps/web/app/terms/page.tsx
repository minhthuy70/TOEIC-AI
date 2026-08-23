import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-8 md:p-12 border border-zinc-800 shadow-2xl">
        {/* Back Button */}
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại đăng ký
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-red-500 text-center">ĐIỀU KHOẢN SỬ DỤNG</h1>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p className="italic text-zinc-400">
            Chào mừng bạn đến với BELLA TOEIC AI. Xin vui lòng đọc kỹ các Điều khoản sử dụng này trước khi sử dụng nền tảng của chúng tôi. Bằng việc đăng ký tài khoản hoặc sử dụng dịch vụ, bạn đồng ý chịu sự ràng buộc của các điều khoản dưới đây.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-2">1. Chấp nhận Điều khoản</h2>
          <p>
            Bằng việc truy cập, tải ứng dụng hoặc sử dụng các dịch vụ của BELLA TOEIC AI ("Dịch vụ"), bạn đồng ý tuân thủ toàn bộ các quy định trong Điều khoản Sử dụng này. Nếu bạn không đồng ý với bất kỳ nội dung nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">2. Mô tả Dịch vụ</h2>
          <p>
            BELLA TOEIC AI cung cấp nền tảng học tiếng Anh ôn thi TOEIC ứng dụng Trí tuệ Nhân tạo (AI). Dịch vụ bao gồm các bài kiểm tra đánh giá năng lực, lộ trình học cá nhân hóa, bài tập thực hành, thống kê kết quả và các tính năng hỗ trợ học tập khác. Chúng tôi không ngừng nâng cấp hệ thống để mang lại trải nghiệm tốt nhất, do đó các tính năng có thể được thêm mới hoặc loại bỏ mà không cần báo trước.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">3. Đăng ký và Bảo mật Tài khoản</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký (như email, họ tên).</li>
            <li>Bạn tự chịu trách nhiệm bảo mật thông tin đăng nhập và mật khẩu của mình. BELLA TOEIC AI sẽ không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh do tài khoản của bạn bị sử dụng trái phép do lỗi bảo mật từ phía bạn.</li>
            <li>Mỗi người dùng chỉ được tạo và sử dụng một tài khoản cá nhân. Việc chia sẻ tài khoản cho nhiều người sử dụng cùng lúc bị nghiêm cấm.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">4. Trách nhiệm của Người sử dụng</h2>
          <p>Khi sử dụng BELLA TOEIC AI, bạn cam kết **KHÔNG**:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sử dụng phần mềm, công cụ tự động (bot, spider) để thu thập dữ liệu (câu hỏi, đề thi) từ hệ thống của chúng tôi.</li>
            <li>Sao chép, phát tán, bán hoặc cấp phép lại các nội dung, bài học của BELLA TOEIC AI cho bên thứ ba.</li>
            <li>Cố gắng xâm nhập, tấn công, thay đổi hoặc phá hoại hệ thống máy chủ, cơ sở dữ liệu của chúng tôi.</li>
            <li>Đăng tải các nội dung vi phạm pháp luật, xúc phạm, lừa đảo, hoặc không phù hợp với văn hóa, thuần phong mỹ tục Việt Nam trên các không gian thảo luận (nếu có).</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">5. Quyền Sở hữu Trí tuệ</h2>
          <p>
            Toàn bộ bản quyền, thương hiệu, mã nguồn, nội dung bài giảng, thuật toán AI và các tài sản trí tuệ khác liên quan đến BELLA TOEIC AI đều thuộc quyền sở hữu độc quyền của chúng tôi. Việc sử dụng dịch vụ không trao cho bạn bất kỳ quyền sở hữu nào đối với các nội dung trên, ngoại trừ quyền sử dụng cá nhân nhằm mục đích học tập theo quy định của nền tảng.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">6. Giới hạn Trách nhiệm</h2>
          <p>
            Mặc dù BELLA TOEIC AI cam kết mang lại nội dung chất lượng cao và các đánh giá chính xác nhất từ hệ thống AI, chúng tôi không đảm bảo rằng kết quả học tập của bạn trên nền tảng sẽ tương đương hoàn toàn với điểm số thi TOEIC thực tế của IIG. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ việc bạn sử dụng dịch vụ, hoặc do hệ thống bảo trì, lỗi mạng bất khả kháng.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">7. Chấm dứt Dịch vụ</h2>
          <p>
            Chúng tôi có quyền đình chỉ hoặc khóa vĩnh viễn tài khoản của bạn bất cứ lúc nào nếu phát hiện bạn vi phạm Điều khoản sử dụng này, hoặc có hành vi gian lận, phá hoại nền tảng. Bạn cũng có quyền yêu cầu xóa tài khoản của mình thông qua tính năng hoặc gửi email hỗ trợ.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">8. Sửa đổi Điều khoản</h2>
          <p>
            BELLA TOEIC AI có quyền điều chỉnh, sửa đổi Điều khoản sử dụng này vào bất kỳ lúc nào để phù hợp với sự phát triển của hệ thống và quy định pháp luật. Những thay đổi sẽ có hiệu lực ngay khi được cập nhật trên website. Việc bạn tiếp tục sử dụng nền tảng đồng nghĩa với việc bạn đồng ý với các điều khoản mới.
          </p>

          <div className="mt-12 pt-6 border-t border-zinc-700">
            <p className="text-zinc-400">
              Mọi thắc mắc về Điều khoản sử dụng, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@bella-toeic-ai.com" className="text-red-500 hover:underline">support@bella-toeic-ai.com</a>
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
