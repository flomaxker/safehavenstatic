<?php
// --- Configuration ---
$recipient_email = "hello@safehavendutch.nl";
$server_mandated_from_email = "noreply@kersten.online";
$from_display_name = "Safe Haven Dutch Coaching Contact Form";
$email_subject_prefix = "New Contact Form Submission";

// --- Initialize Response Array ---
$response = ['success' => false, 'errors' => []];

// --- Check Request Method ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Optional: Keep logging for a bit if you like
    // error_log("HTML_EMAIL_MAILER - POST DATA RECEIVED: " . print_r($_POST, true), 0);

    // --- Get and Trim Input ---
    $user_name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $user_email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $user_message = isset($_POST['message']) ? trim($_POST['message']) : ''; // Raw message

    // --- Server-side Validate Input ---
    if (empty($user_name)) {
        $response['errors'][] = "Name is required.";
    }
    if (empty($user_email)) {
        $response['errors'][] = "Email is required.";
    } elseif (!filter_var($user_email, FILTER_VALIDATE_EMAIL)) {
        $response['errors'][] = "Invalid email format.";
    }
    if (empty($user_message)) {
        $response['errors'][] = "Message is required.";
    }

    if (!empty($response['errors'])) {
        http_response_code(400);
        // error_log("HTML_EMAIL_MAILER - Validation errors: " . print_r($response['errors'], true), 0);
    } else {
        // --- Sanitize inputs appropriately ---
        // For display in HTML (subject, body names, etc.), htmlspecialchars is good.
        $display_user_name = htmlspecialchars($user_name, ENT_QUOTES, 'UTF-8');
        $display_user_email = htmlspecialchars($user_email, ENT_QUOTES, 'UTF-8'); // For display in HTML body

        // For the Reply-To header, we need the raw (but validated) email and potentially name
        $header_replyto_name = $user_name; // Can use raw name for Reply-To display name
        $header_replyto_email = $user_email; // Use raw validated email for Reply-To

        // For the message content in an HTML email:
        // 1. Escape HTML special characters to prevent XSS if this HTML is ever viewed in a browser.
        // 2. Convert newlines (from textarea) to <br> tags for HTML display.
        $message_for_html_body = nl2br(htmlspecialchars($user_message, ENT_QUOTES, 'UTF-8'));

        // --- Construct Email Content ---
        $email_subject = $email_subject_prefix;
        if (!empty($display_user_name)) {
            $email_subject .= " from " . $display_user_name;
        }

        // Construct HTML Email Body
        $email_body = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>";
        $email_body .= "<title>" . htmlspecialchars($email_subject, ENT_QUOTES, 'UTF-8') . "</title>";
        $email_body .= "<style>";
        $email_body .= "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }";
        $email_body .= ".container { width: 90%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }";
        $email_body .= "h2 { color: #2c3e50; margin-top:0; }";
        $email_body .= "p { margin-bottom: 10px; }";
        $email_body .= "strong { color: #34495e; }";
        $email_body .= ".message-content { padding: 15px; background-color: #ffffff; border: 1px solid #eee; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; word-wrap: break-word; }"; // white-space: pre-wrap helps with long lines
        $email_body .= "hr { border: 0; height: 1px; background: #ddd; margin: 20px 0; }";
        $email_body .= ".footer { font-size: 0.9em; color: #7f8c8d; text-align: center; margin-top: 20px;}";
        $email_body .= "</style></head><body>";
        $email_body .= "<div class='container'>";
        $email_body .= "<h2>New Contact Form Submission</h2>";
        $email_body .= "<p>You have received a new message from your website contact form:</p>";
        $email_body .= "<hr>";
        $email_body .= "<p><strong>Name:</strong> " . $display_user_name . "</p>";
        $email_body .= "<p><strong>Email:</strong> <a href='mailto:" . rawurlencode($user_email) . "'>" . $display_user_email . "</a></p>"; // Make email clickable
        $email_body .= "<p><strong>Message:</strong></p>";
        $email_body .= "<div class='message-content'>" . $message_for_html_body . "</div>";
        $email_body .= "<hr>";
        $email_body .= "<p class='footer'><em>Sent via Safe Haven Dutch Coaching Website</em></p>";
        $email_body .= "</div>";
        $email_body .= "</body></html>";


        // --- Construct Headers ---
        $headers = "From: " . $from_display_name . " <" . $server_mandated_from_email . ">\r\n";
        // For Reply-To, it's generally better to use the raw name and email (after validation)
        // rather than htmlspecialchar'd versions, as mail clients handle display names.
        $headers .= "Reply-To: " . $header_replyto_name . " <" . $header_replyto_email . ">\r\n";
        // *** CHANGE Content-Type to HTML ***
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "MIME-Version: 1.0\r\n"; // Good practice for HTML emails
        $headers .= "X-Mailer: PHP/" . phpversion();


        // Optional: Log preview
        // error_log("HTML_EMAIL_MAILER - PREPARING TO SEND EMAIL. Subject: '" . $email_subject . "'", 0);

        if (mail($recipient_email, $email_subject, $email_body, $headers)) {
            $response['success'] = true;
            http_response_code(200);
            // error_log("HTML_EMAIL_MAILER - Mail successfully sent to: " . $recipient_email, 0);
        } else {
            $php_last_error = error_get_last();
            $mail_failure_reason = "mail() function returned false. ";
            if ($php_last_error !== null && stripos(strtolower($php_last_error['message']), 'mail') !== false) {
                $mail_failure_reason .= "Last PHP error related to mail: " . htmlspecialchars($php_last_error['message']);
            } else {
                $mail_failure_reason .= "No specific PHP error captured.";
            }
            error_log("HTML_EMAIL_MAILER - Mail sending FAILED. Reason: $mail_failure_reason", 0); // Keep this error log
            $response['errors'][] = "Message could not be sent due to a server issue. Please try again.";
            $response['detailed_error_guess'] = $mail_failure_reason;
            http_response_code(500);
        }
    }
} else {
    $response['errors'][] = "Invalid request method.";
    http_response_code(405);
    // error_log("HTML_EMAIL_MAILER - Invalid request method.", 0);
}

header('Content-Type: application/json');
echo json_encode($response);
exit;
?>