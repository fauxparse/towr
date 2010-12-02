class ApplicationController < ActionController::Base
  protect_from_forgery
  
protected
  def current_user
    @current_user ||= User.find_by_id(session[:user_id]) if session[:user_id].present?
  end
  helper_method :current_user
  
  def logged_in?
    current_user.present?
  end
  helper_method :logged_in?
  
end
