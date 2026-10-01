import { MOODLE_REST_URL, MOODLE_URL } from "../config/moodle";

export async function loginMoodle(username: string, password: string) {
  const body = new URLSearchParams();

  body.append("username", username);
  body.append("password", password);
  body.append("service", "moodle_mobile_app");

  const response = await fetch(`${MOODLE_URL}/login/token.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
}

export async function getUserAttempts(
  token: string,
  quizId: number,
  userId: number,
) {
  const body = new URLSearchParams();

  body.append("wstoken", token);
  body.append("wsfunction", "mod_quiz_get_user_attempts");
  body.append("moodlewsrestformat", "json");
  body.append("quizid", String(quizId));
  body.append("userid", String(userId));

  const response = await fetch(MOODLE_REST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
}

export async function startAttempt(token: string, quizId: number) {
  const body = new URLSearchParams();

  body.append("wstoken", token);
  body.append("wsfunction", "mod_quiz_start_attempt");
  body.append("moodlewsrestformat", "json");
  body.append("quizid", String(quizId));

  const response = await fetch(MOODLE_REST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
}

export async function getAttemptData(
  token: string,
  attemptId: number,
  page = 0,
) {
  const body = new URLSearchParams();

  body.append("wstoken", token);
  body.append("wsfunction", "mod_quiz_get_attempt_data");
  body.append("moodlewsrestformat", "json");
  body.append("attemptid", String(attemptId));
  body.append("page", String(page));

  const response = await fetch(MOODLE_REST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
}
