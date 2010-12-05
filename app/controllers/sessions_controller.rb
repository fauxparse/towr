require "auth/twitter"

class SessionsController < ApplicationController
  def new
    if api
      session[:return_to] = request.referrer
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
  
protected
  def api
    @api ||= Auth.const_get(params[:method].to_s.camelize).try(:new, self)
  end
end
