require "auth"

class SessionsController < ApplicationController
  def new
    Rails.logger.info session.inspect.green
    if api
      session[:return_to] ||= request.referrer
      redirect_to api.authentication_url
    else
      redirect_to "/"
    end
  end
  
  def create
    @user = api.login
    session[:user_id] = @user.id if @user
    redirect_to session[:return_to] || root_url
  end
  
  def destroy
    session.delete :user_id
    session.delete :return_to
    redirect_to root_url
  end
  
  def prompt
    
  end
  
protected
  def api
    @api ||= Auth[params[:method]].try(:new, self)
  end
end
