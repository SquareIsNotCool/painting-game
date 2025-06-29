export const EASE_DURATION = 0.66;
export const EASE_FUNCTION = Enum.EasingStyle.Cubic;
export const EASE_DIRECTION = Enum.EasingDirection.Out;

export const TWEEN_INFO = new TweenInfo(EASE_DURATION, EASE_FUNCTION, EASE_DIRECTION);
export const TWEEN_INFO_LIGHTING = new TweenInfo(EASE_DURATION * 4, Enum.EasingStyle.Exponential, EASE_DIRECTION);