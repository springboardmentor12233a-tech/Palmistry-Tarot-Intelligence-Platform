from PIL import Image, ImageDraw
import cv2

from rectification import detect_landmarks


def measure(path_to_warped_image_mini, lines):

    heart_thres_x = 0
    head_thres_x = 0
    life_thres_y = 0

    image = cv2.flip(cv2.imread(path_to_warped_image_mini), 1)

    if image is None:
        return None, None

    image_height, image_width = image.shape[:2]

    landmarks = detect_landmarks(path_to_warped_image_mini)

    if landmarks is None:
        return None, None

    zero = landmarks[0].y
    one = landmarks[1].y
    five = landmarks[5].x
    nine = landmarks[9].x
    thirteen = landmarks[13].x

    heart_thres_x = image_width * (1 - (nine + (five - nine) * 2 / 5))
    head_thres_x = image_width * (1 - (thirteen + (nine - thirteen) / 3))
    life_thres_y = image_height * (one + (zero - one) / 3)

    im = Image.open(path_to_warped_image_mini)

    width = 3

    if (None in lines) or (len(lines) < 3):
        return None, None

    draw = ImageDraw.Draw(im)

    # ---------------- Heart Line ----------------

    heart_line = lines[0]

    heart_line_points = [tuple(reversed(l[:2])) for l in heart_line]

    heart_line_tip = heart_line_points[0]

    heart_content_1 = (
    "The Heart Line reflects emotional expression, relationships, "
    "affection, and commitment."
    )

    if heart_line_tip[0] < heart_thres_x:
     heart_content_2 = (
        "Your Heart Line is long, indicating a tendency to build "
        "strong, lasting, and meaningful relationships with those "
        "you care about."
    )
    else:
       heart_content_2 = (
        "Your Heart Line is short, indicating an open and adaptable "
        "nature, with the potential to form a wide range of relationships "
        "throughout your life."
        )

    draw.line(heart_line_points, fill="red", width=width)

    # ---------------- Head Line ----------------

    head_line = lines[1]

    head_line_points = [tuple(reversed(l[:2])) for l in head_line]

    head_line_tip = head_line_points[-1]

    head_content_1 = (
        "Head line tells us about our intellectual "
        "curiosities and pursuits."
    )

    if head_line_tip[0] > head_thres_x:
        head_content_2 = (
            "Your Head line is long, which means you will explore "
            "a broad range of topics throughout your life."
        )
    else:
        head_content_2 = (
            "Your Head line is short, which means you will be "
            "fascinated by one topic and dig deep into it."
        )

    draw.line(head_line_points, fill="green", width=width)

    # ---------------- Life Line ----------------

    life_line = lines[2]

    life_line_points = [tuple(reversed(l[:2])) for l in life_line]

    life_line_tip = life_line_points[-1]

    life_content_1 = (
        "Life line reveals your experiences, vitality, and zest. "
        "Be careful, it has nothing to do with how long you will live!"
    )

    if life_line_tip[1] > life_thres_y:
        life_content_2 = (
            "Your Life line is long, which means you tend to solve "
            "problems with other people rather than by yourself."
        )
    else:
        life_content_2 = (
            "Your Life line is short, which means you are "
            "independent and autonomous."
        )

    draw.line(life_line_points, fill="blue", width=width)

    contents = [
        heart_content_1,
        heart_content_2,
        head_content_1,
        head_content_2,
        life_content_1,
        life_content_2,
    ]

    return im, contents
