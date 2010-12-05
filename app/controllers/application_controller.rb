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
  
  def self.require_login(*args)
    before_filter :confirm_login, *args
  end
    
  def confirm_login
    unless logged_in?
      session[:return_to] = request.params
      redirect_to login_prompt_path
    end
  end
  
end
