"""
Fixes a real bug found in palm_line_detection.ipynb's metrics cell.

The original code computed FP and FN identically:
    FP = len(scores_df) * 3 - TP
    FN = len(scores_df) * 3 - TP
Since FP == FN by construction, precision, recall, and F1 are all
mathematically forced to equal accuracy - they are not four independent
numbers, just the same number printed four times. Reporting all four as
if they were separate findings would look like padding a single metric.

This script reports the one number that's actually meaningful: accuracy.
"""

import pandas as pd


def summarize_palm_accuracy(scores_df):
    """
    scores_df: a DataFrame with a 'lines_correct_out_of_3' column,
    same shape as the one produced in palm_line_detection.ipynb.
    """
    total_lines = len(scores_df) * 3
    correct_lines = scores_df["lines_correct_out_of_3"].sum()
    accuracy = correct_lines / total_lines if total_lines else 0

    print(f"Images manually reviewed: {len(scores_df)}")
    print(f"Lines drawn total: {total_lines}")
    print(f"Lines judged correct: {correct_lines}")
    print(f"Measured accuracy: {accuracy * 100:.1f}%")
    print()
    print("Note: precision/recall/F1 are not reported separately here.")
    print("With this scoring method (a single correct-count per image, no")
    print("labeled false-positive vs false-negative distinction), those three")
    print("numbers are mathematically identical to accuracy - reporting only")
    print("accuracy avoids presenting one number as if it were four.")

    return {"images": len(scores_df), "total_lines": total_lines,
            "correct_lines": int(correct_lines), "accuracy": accuracy}


if __name__ == "__main__":
    # Recreate your actual real results from palm_line_detection.ipynb, to prove
    # this produces the same 52.2% - just reported honestly as one number.
    real_scores = pd.DataFrame({
        "lines_correct_out_of_3": [2,1,1,1,3,3,1,1,1,3,3,1,1,1,1,3,1,2,0,0,1,3,2]
    })
    summarize_palm_accuracy(real_scores)
