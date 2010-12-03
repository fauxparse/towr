class MapsController < ApplicationController
  def index
    
  end

  def new
    @map = Map.new :user => current_user
  end

  def show
    @map = Map.find params[:id].to_map_code
  end

end
